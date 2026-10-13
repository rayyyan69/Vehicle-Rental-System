# DriveEasy – Vehicle Rental Management System

A beginner-friendly **frontend demo project** built with HTML, CSS and JavaScript. It shows how a small vehicle rental business could manage vehicles, customers, bookings, availability and rental costs – all inside the browser.

> **Demo only.** Data is stored in your browser's `localStorage`, which is **not a secure database**. The project does not provide real booking security, take payments, or verify driving licences (the licence number is only checked for format). All vehicles, registrations and contact details are fictional.

## Features

- Modern blue / white / dark responsive design (mobile, tablet, desktop)
- Hero section, smooth scrolling, hover effects and simple animations
- Car, bike and truck cards with images (placeholder shown if an image fails)
- Filter vehicles by type
- Rent form with auto-generated Customer ID and validation (name, phone, email, licence format, date, days)
- Live rental calculation: **Total Rent = Price Per Day × Number of Days**
- Booking confirmation with Booking ID, customer, vehicle, duration, total and status
- Prevents booking a vehicle that is already rented
- My Bookings page with rental history, status filter and **Return Vehicle** button
- Availability updates on booking and on return
- Vehicles, bookings and customers saved in `localStorage` (persist after refresh)
- "Explore Our Vehicles" video section with image fallback
- "Reset Demo Data" button to start over

## Technologies Used

- HTML – page structure
- CSS – design, animations, responsive layout
- JavaScript – booking logic and calculations
- localStorage – browser-based storage

No frameworks, backend or database are used.

## Files

| File | Purpose |
| --- | --- |
| `README.md` | Project documentation |
| `index.html` | Page structure: navbar, hero, vehicles, video, form, bookings, about, footer |
| `style.css` | Colours, layout, animations and responsive rules |
| `script.js` | Classes, sample data, validation, booking/return logic, localStorage |

## How to Run

1. Put all four files in the same folder.
2. Double-click `index.html` to open it in a browser (Chrome, Edge, Firefox, Safari).
3. An internet connection is needed to load the vehicle images.

To show a video in "Explore Our Vehicles", paste a public `.mp4` link into the `VIDEO_URL` constant at the top of `script.js`. While it is empty (or if the video fails), a vehicle photo is shown instead.

## Sample Vehicle Information

| ID | Vehicle | Type | Registration | Price / day |
| --- | --- | --- | --- | --- |
| V001 | Hyundai Creta | Car | KA09AB1234 | ₹2,000 |
| V002 | Maruti Suzuki Swift | Car | KA09AB4321 | ₹1,200 |
| V003 | Kia Seltos | Car | KA09AB7788 | ₹2,200 |
| V004 | Royal Enfield Classic 350 | Bike | KA09CD5678 | ₹700 |
| V005 | KTM Duke 200 | Bike | KA09CD1122 | ₹800 |
| V006 | Honda Activa 6G | Bike | KA09CD3344 | ₹400 |
| V007 | Tata Ace | Truck | KA09EF9012 | ₹3,000 |
| V008 | Mahindra Bolero Pik-Up | Truck | KA09EF3456 | ₹3,500 |
| V009 | Eicher Pro 2049 | Truck | KA09EF7890 | ₹4,500 |

These are fictional sample records.

## JavaScript and Java OOP Concepts

If you have learned Java, many ideas carry over directly:

| Java OOP concept | In this project |
| --- | --- |
| Class | `class Vehicle`, `class Customer`, `class Booking` in `script.js` |
| Object | `new Vehicle("V001", "KA09AB1234", ...)` – each vehicle, customer and booking is an object |
| Constructor | The `constructor(...)` method of each class sets the starting values |
| Fields / attributes | `this.registration`, `this.pricePerDay`, `this.available`, `this.status` |
| Methods | Functions such as `calculateTotalRent()`, `returnVehicle()`, `confirmBooking()` |
| `ArrayList<Vehicle>` | JavaScript arrays: `vehicles`, `bookings`, `customers` |
| Encapsulation | Related data is grouped in objects; validation and booking rules live in dedicated functions |
| Persistence (like a database/file) | `JSON.stringify` saves the arrays to `localStorage`; `JSON.parse` loads them back |

Differences: JavaScript has no `private` fields in this simple code, no static typing, and the logic functions here are standalone rather than methods inside the classes, to keep things easy to read.

## Possible Improvements

- Edit/cancel bookings and late-return charges
- Check date overlaps so one vehicle can be booked for future periods
- A real backend and database for genuine multi-user data and security
