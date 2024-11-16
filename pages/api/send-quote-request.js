import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      name,
      companyName,
      email,
      phone,
      startDate,
      endDate,
      comments,
      products,
      totalPrice
    } = req.body;

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Format products list for email
    const productsList = products.map(product => 
      `- ${product.name}: $${product.price}/week`
    ).join('\n');

    // Calculate rental duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const weeks = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 7));

    // Create email content
    const emailContent = `
New Quote Request

Customer Information:
-------------------
Name: ${name}
Company: ${companyName}
Email: ${email}
Phone: ${phone}

Rental Period:
-------------
Start Date: ${startDate}
End Date: ${endDate}
Duration: ${weeks} week(s)

Selected Items:
--------------
${productsList}

Total Price per Week: $${totalPrice.toFixed(2)}
Estimated Total (${weeks} weeks): $${(totalPrice * weeks).toFixed(2)}

Additional Comments:
------------------
${comments || 'No additional comments provided.'}
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'darrinmalone1@gmail.com',
      subject: `New Quote Request from ${name} - ${companyName}`,
      text: emailContent,
    });

    res.status(200).json({ message: 'Quote request sent successfully' });
  } catch (error) {
    console.error('Error sending quote request:', error);
    res.status(500).json({ message: 'Failed to send quote request' });
  }
}
