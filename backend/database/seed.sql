
USE expensio;

INSERT INTO users
(name, email, password, role, employee_code, department, profile_signature)
VALUES
(
    'Tanuja Prasad',
    'employee@gmail.com',
    'PASTE_EMPLOYEE_BCRYPT_HASH',
    'EMPLOYEE',
    'EMP001',
    'Information Technology',
    NULL
),
(
    'Meera Deshpande',
    'director@gmail.com',
    'PASTE_DIRECTOR_BCRYPT_HASH',
    'DIRECTOR',
    'DIR001',
    'Management',
    NULL
),
(
    'Priya Kulkarni',
    'accounts@gmail.com',
    'PASTE_ACCOUNTS_BCRYPT_HASH',
    'ACCOUNTS',
    'ACC001',
    'Finance',
    NULL
);


USE expensio;

INSERT INTO vouchers
(
    voucher_number,
    employee_id,
    voucher_date,
    expense_date,
    department,
    title,
    category,
    description,
    amount,
    status,
    employee_signature,
    submitted_at
)
SELECT
    CONCAT('DEMO-', LEFT(REPLACE(UUID(), '-', ''), 12)),
    u.id,
    d.voucher_date,
    d.expense_date,
    d.department,
    d.title,
    d.category,
    d.description,
    d.amount,
    d.status,
    NULL,
    NULL
FROM users u
CROSS JOIN
(
    SELECT
        '2026-10-10' AS voucher_date,
        '2026-10-09' AS expense_date,
        'Information Technology' AS department,
        'Client Meeting Travel' AS title,
        'Travel' AS category,
        'Cab fare for client meeting at Hinjewadi office' AS description,
        1850.00 AS amount,
        'DRAFT' AS status

    UNION ALL SELECT
        '2026-10-09', '2026-10-08',
        'Information Technology',
        'Office Stationery Purchase',
        'Office Supplies',
        'Purchase of notebooks, pens and printing supplies',
        2450.00, 'DRAFT'

    UNION ALL SELECT
        '2026-10-08', '2026-10-07',
        'Information Technology',
        'Cloud Hosting Subscription',
        'Software',
        'Monthly cloud infrastructure charges for internal project',
        5999.00, 'DRAFT'

    UNION ALL SELECT
        '2026-10-07', '2026-10-06',
        'Information Technology',
        'Business Lunch with Client',
        'Meals',
        'Lunch expenses during project discussion',
        3200.00, 'DRAFT'

    UNION ALL SELECT
        '2026-10-06', '2026-10-05',
        'Information Technology',
        'Bengaluru Business Trip',
        'Travel',
        'Travel expenses for quarterly project review meeting',
        8750.00, 'DRAFT'

    UNION ALL SELECT
        '2026-10-05', '2026-10-04',
        'Information Technology',
        'Hotel Accommodation',
        'Accommodation',
        'Hotel stay during Bengaluru client visit',
        6800.00, 'DRAFT'

    UNION ALL SELECT
        '2026-10-04', '2026-10-03',
        'Information Technology',
        'Internet Reimbursement',
        'Internet',
        'Monthly broadband reimbursement for remote work',
        1299.00, 'DRAFT'

    UNION ALL SELECT
        '2026-10-03', '2026-10-02',
        'Information Technology',
        'Professional Training Course',
        'Training',
        'Technical upskilling and certification program',
        4500.00, 'DRAFT'

) AS d
WHERE u.email = 'employee@gmail.com';

SELECT id,name,email,role,department,employee_code,
       (profile_signature IS NOT NULL) AS has_profile_signature
FROM users ORDER BY id;

SELECT v.id,v.voucher_number,u.name AS employee_name,
       v.title,v.category,v.amount,v.status,v.employee_signature
FROM vouchers v JOIN users u ON u.id=v.employee_id
ORDER BY v.id DESC;
