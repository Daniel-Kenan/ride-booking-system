import subprocess
import smtplib
import ssl
import sys
import datetime
from email.message import EmailMessage

def send_email(receiver_email, subject, body):
    # Your email credentials
    sender_email = "botauto212@gmail.com"
    sender_password = "cjeifgsiqfivevdx"

    # Create the email message
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg.set_content(body)

    # Connect to the SMTP server using SSL
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(sender_email, sender_password)
        smtp.sendmail(msg['From'], msg['To'], msg.as_string())

def git_add_commit_push(commit_message):
    # Git add, commit, and push
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", commit_message])
    subprocess.run(["git", "push"])

if __name__ == "__main__":
    # Check if the commit message is provided as a command-line argument
    if len(sys.argv) < 2:
        print("Usage: python script.py <commit_message>")
        sys.exit(1)

    commit_message = sys.argv[1]

    # List of email addresses to send emails to
    email_addresses = [
        "thembisilesm@gmail.com",
        "percyvalmbatha01@gmail.com",
        "dlaminisindile69@gmail.com",
        "Sizwenicolas061@gmail.com",
        "madalaneoscar50@gmail.com",
        "silindabathobile@gmail.com"
    ]

    # Get the current time for the subject
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Loop through the email addresses, send an email, and perform Git operations for each
    for email_address in email_addresses:
        subject = f"Automated Deploys Cab Central - {current_time}"
        body = f"{commit_message}\n\nPlease check the link of the application for the latest updates."

        # Send email
        send_email(email_address, subject, body)

        # Add, commit, and push to Git with the provided commit message
        git_add_commit_push(commit_message)

    print("Emails sent and Git operations completed successfully.")
