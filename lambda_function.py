import boto3
import csv
import os
import smtplib
from io import BytesIO, StringIO
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from reportlab.pdfgen import canvas

# AWS clients
s3 = boto3.client("s3")
dynamo = boto3.client("dynamodb", region_name=os.environ["REGION"])

# Environment variables
GMAIL_USER = os.environ["GMAIL_USER"]
GMAIL_PASS = os.environ["GMAIL_PASS"]
CERT_BUCKET = os.environ["CERT_BUCKET"]
CERT_TABLE = os.environ["CERT_TABLE"]

def generate_certificate(title, name, description, job_id):
    """Generate a styled PDF certificate with Title, Name, Description, Date."""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=(600, 400))

    # Title
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(300, 320, title)

    # Name
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(300, 250, name)

    # Description
    c.setFont("Helvetica", 16)
    c.drawCentredString(300, 200, description)

    # Date
    c.setFont("Helvetica-Oblique", 12)
    c.drawCentredString(300, 150, f"Date: {datetime.utcnow().date()}")

    # Footer
    c.setFont("Helvetica", 10)
    c.drawCentredString(300, 50, f"Job ID: {job_id}")

    c.save()
    buffer.seek(0)
    return buffer.getvalue()

def save_to_s3(job_id, email, pdf_bytes):
    key = f"Certificates/{job_id}/{email}.pdf"
    s3.put_object(Bucket=CERT_BUCKET, Key=key, Body=pdf_bytes, ContentType="application/pdf")
    return key

def insert_certificate(job_id, name, email, cert_key):
    cert_id = f"{job_id}#{email}"
    dynamo.put_item(
        TableName=CERT_TABLE,
        Item={
            "certId": {"S": cert_id},
            "jobId": {"S": job_id},
            "name": {"S": name},
            "email": {"S": email},
            "s3Key": {"S": cert_key},
            "createdAt": {"S": datetime.utcnow().isoformat()}
        }
    )

def send_email_gmail(to_email, name, pdf_bytes):
    msg = MIMEMultipart()
    msg["Subject"] = "Your Certificate"
    msg["From"] = GMAIL_USER
    msg["To"] = to_email

    # Body
    body = MIMEText(f"Hi {name},\n\nPlease find your certificate attached.\n\nRegards,\nTeam")
    msg.attach(body)

    # PDF attachment
    attachment = MIMEApplication(pdf_bytes, _subtype="pdf")
    attachment.add_header("Content-Disposition", "attachment", filename="certificate.pdf")
    msg.attach(attachment)

    # Send email via Gmail SMTP
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_PASS)
        server.send_message(msg)

def lambda_handler(event, context):
    try:
        for record in event["Records"]:
            bucket = record["s3"]["bucket"]["name"]
            key = record["s3"]["object"]["key"]

            # Fetch object metadata
            obj_head = s3.head_object(Bucket=bucket, Key=key)
            metadata = obj_head.get("Metadata", {})

            title = metadata.get("title", "Certificate")
            description = metadata.get("description", "")
            job_id = metadata.get("jobid", str(datetime.utcnow().timestamp()))

            # Fetch CSV content
            obj = s3.get_object(Bucket=bucket, Key=key)
            body = obj["Body"].read().decode("utf-8")
            reader = csv.DictReader(StringIO(body))

            for row in reader:
                name = row["name"]
                email = row["email"]

                if not name or not email:
                    continue

                # Generate PDF certificate
                pdf_bytes = generate_certificate(title, name, description, job_id)

                # Save PDF to S3
                cert_key = save_to_s3(job_id, email, pdf_bytes)

                # Insert record into DynamoDB
                insert_certificate(job_id, name, email, cert_key)

                # Send email via Gmail
                send_email_gmail(email, name, pdf_bytes)

        return {"statusCode": 200, "body": f"Processed certificates for job {job_id}"}

    except Exception as e:
        print("Error:", str(e))
        return {"statusCode": 500, "body": str(e)}
