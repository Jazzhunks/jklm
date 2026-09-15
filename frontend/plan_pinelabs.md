# Pine Labs Cloud Integration Plan

## Goal Description
Integrate the Pine Labs In-Store Cloud Integration API to push payment transactions from the ERP directly to physical EDC (card swipe) terminals for payment collection and automated receipt printing.

## User Review Required

> [!IMPORTANT]
> **Clarification Needed on Use-Case:** 
> You mentioned "for receipt printing". Do you want to use the Pine Labs terminal **strictly as a receipt printer** for cash/external payments, or do you want the ERP to **initiate card/UPI payments** on the terminal (so the terminal prompts the customer to insert their card, processes the payment, and prints the charge slip)? The Cloud API is primarily designed for the latter (pushing the bill amount to the terminal for payment collection).

> [!WARNING]
> **Hardware Mapping:**
> Because Pine Labs devices are physical hardware, we will need to store the **IMEI / Device ID** of the EDC machine(s). Do you have a single EDC machine per branch, or multiple? My proposed plan assumes we will add a configuration section in **Branch Settings** to map the terminal ID.

## Proposed Changes

### Configuration Layer
#### [NEW] `backend/pine_labs_client.py`
Create a dedicated API client for Pine Labs with two core methods based on their docs:
- `push_transaction(amount, invoice_no, terminal_imei, merchant_id, secret)`: Hits the *Upload Billed Transaction API*.
- `check_status(invoice_no)`: Hits the *GetStatus API* to confirm if the payment succeeded.

### Backend Routes
#### [MODIFY] `backend/erp_routes.py`
- Add settings endpoints to store Pine Labs `merchant_id`, `secret_key`, and `terminal_imei` at the Branch level.
- Add `POST /erp/payments/{id}/pinelabs/push` to push an ERP payment to the terminal.
- Add `GET /erp/payments/{id}/pinelabs/status` to poll the terminal's transaction status.

### Frontend UI
#### [MODIFY] `frontend/src/pages/erp/ErpBranches.jsx`
- Add a new "Payment Gateway Settings" section to the Branch edit modal to configure Pine Labs credentials (Merchant ID, Secret, EDC IMEI).

#### [MODIFY] `frontend/src/pages/erp/ErpStudentDetail.jsx`
- In the "Record Payment" workflow, add a payment method option for **Pine Labs EDC**.
- When selected, after saving the payment to the ERP as "Pending", display a loading state ("Waiting for customer to pay on terminal...") that polls the Pine Labs status.
- Once the terminal confirms payment, mark the ERP payment as "Successful" and generate our internal digital receipt.

## Verification Plan

### Manual Verification
- Go to Branch Settings and configure mock Pine Labs credentials.
- Record a payment on a student profile and select "Pine Labs EDC".
- Verify the backend successfully formats and transmits the XML/JSON payload required by Pine Labs `Upload Billed Transaction API`.
- Simulate a successful response from Pine Labs to ensure the ERP payment unlocks and clears correctly.
