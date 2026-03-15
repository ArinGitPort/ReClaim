1. The Campus Identity (The Core)
Student / Staff ID Number:

Format: <Input placeholder="e.g., 2020-123456" />

Validation Logic: You will need to enforce this specific pattern. The first four digits are the enrollment year, followed by a dash, followed by 6 digits.

Institutional Email Address:

Format: <Input type="email" placeholder="juan.delacruz@students.national-u.edu.ph" />

Security Rule: This is critical. You must restrict registration only to emails ending in your university's domain (e.g., @national-u.edu.ph or @students.nu.edu.ph). Do not allow @gmail.com or @yahoo.com. This instantly blocks outsiders from creating accounts and viewing your gallery.

2. The Personal Details (The Basics)
First Name & Last Name:

Keep these as two separate fields. It makes sorting your database alphabetically much easier later.

Note on Philippine context: Middle names are heavily used here, but for a simple web app, you can usually leave it out to save space, or make it an optional Middle Initial field.

3. The Logistics (The Lifeline)
Mobile Number:

Format: <Input type="tel" placeholder="09XX-XXX-XXXX" />

Why it's essential: If a student loses their laptop, they cannot log into their email to check if it was found. The Admin needs a local PH mobile number to send a quick text: "ReClaim: Your ID was turned in to the Admin office."

4. The Security
Password: Standard hidden input.

Confirm Password: To prevent typos during account creation.