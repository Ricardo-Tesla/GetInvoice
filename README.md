GetInvoice
📌 Project Overview:

GetInvoice is a web-based invoicing system designed to streamline the invoice generation process in school finance offices. 
It minimizes long queues by enabling students to request, view, and download invoices and receipts efficiently.

🚀 Features:

User authentication (Sign-up & Login)

Invoice generation and tracking

Receipt request and download

Transaction management

Role-based access (Finance Staff, System Admin, Users)



🛠️ Tech Stack

Frontend: HTML, CSS, Bootstrap, Javascript

Backend: Spring Boot, Java

Database: H2 Database

Testing: Postman


🎯 System Roles

Finance Staff

View users & transactions

Monitor invoice status

Approve requested receipts

User (Student)

Request & download receipts

View transaction history

System Admin

Manage users & transactions


🏗️ Installation & Setup

Prerequisites

Java 17

Spring Boot 3.3.1

Gradle

IntelliJ or any IDE

Steps

Clone the repository:

git clone https://github.com/your-username/invoiceeasy.git

cd invoiceeasy

Build & Run the application:

./gradlew bootRun

Access the application at http://localhost:8080

You can access the frontend by running Live server / localhost:5500

📜 API Endpoints

Method	Endpoint	Description

POST	/api/auth/signup	User registration

POST	/api/auth/login	User login

GET	/api/invoices	Fetch all invoices

POST	/api/receipts/request	Request a receipt

GET	/api/transactions	View transaction history

📊 Database Schema

Users Table: Stores user details and roles

Invoices Table: Manages invoice records

Transactions Table: Tracks payment history

🛡️ Security Implementation

User authentication with JWT

Role-based access control

Password encryption using BCrypt

📌 Future Enhancements

Email notifications for invoice updates

Mobile app integration

Payment gateway integration

