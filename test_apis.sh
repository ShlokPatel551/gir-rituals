#!/usr/bin/env bash
BASE="http://localhost:3001/api"

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY2xpZW50SWQiOiJHUjdLMk05WCIsImZpcnN0TmFtZSI6IkRlbW8iLCJsYXN0TmFtZSI6IkN1c3RvbWVyIiwiZW1haWwiOiJkZW1vQGdpcnJpdHVhbHMuY29tIiwicGhvbmUiOiI5ODc2NTQzMjEwIiwid2FsbGV0QmFsYW5jZSI6MjEwLCJpc0FkbWluIjpmYWxzZSwicm9sZSI6ImN1c3RvbWVyIiwiYmlsbGluZ0FkZHJlc3MiOnsic3RyZWV0IjoiMTIgRmFybSBMYW5lIiwiY2l0eSI6IkFobWVkYWJhZCIsInN0YXRlIjoiR3VqYXJhdCIsInBpbkNvZGUiOiIzODAwMDEifSwiZGVsaXZlcnlBZGRyZXNzIjp7InN0cmVldCI6IjEyIEZhcm0gTGFuZSIsImNpdHkiOiJBaG1lZGFiYWQiLCJzdGF0ZSI6Ikd1amFyYXQiLCJwaW5Db2RlIjoiMzgwMDAxIn0sImlhdCI6MTc4MDgyMzY5NCwiZXhwIjoxNzgwODI3Mjk0fQ.hmHGMTUqMZ1bNBAoZdHLbLqJeEvEFlw8hSxdt3csUGc"

ADMIN_LOGIN=$(curl -sb /tmp/gir_admin_cookies.txt -sX POST $BASE/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@girrituals.com","password":"password123"}')
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

PASS=0; FAIL=0

ok() {
  local s=$1; shift
  if [[ $s -lt 400 ]]; then echo "  OK  $* ($s)"; ((PASS++)); else echo "  FAIL $* ($s)"; ((FAIL++)); fi
}
chk() {
  local s=$1 want=$2; shift 2
  if [[ $s == $want ]]; then echo "  OK  $* ($s)"; ((PASS++)); else echo "  FAIL $* (got $s expected $want)"; ((FAIL++)); fi
}

echo "===== PUBLIC ====="
ok  "$(curl -so /dev/null -w '%{http_code}' $BASE/health)" "GET /health"
ok  "$(curl -so /dev/null -w '%{http_code}' $BASE/products)" "GET /products"
ok  "$(curl -so /dev/null -w '%{http_code}' $BASE/products/milk)" "GET /products/milk"
chk "$(curl -so /dev/null -w '%{http_code}' $BASE/products/zzz-nope)" 404 "GET /products/nonexistent"
ok  "$(curl -so /dev/null -w '%{http_code}' $BASE/offers)" "GET /offers"

echo ""
echo "===== AUTH ====="
ok  "$(curl -so /dev/null -w '%{http_code}' -X POST $BASE/auth/otp/send \
       -H 'Content-Type: application/json' -d '{"identifier":"smoke@test.com"}')" \
    "POST /auth/otp/send"

chk "$(curl -so /dev/null -w '%{http_code}' -X POST $BASE/auth/otp/verify \
       -H 'Content-Type: application/json' -d '{"identifier":"smoke@test.com","code":"000000"}')" \
    400 "POST /auth/otp/verify (wrong code)"

ok  "$(curl -so /dev/null -w '%{http_code}' -X POST $BASE/auth/forgot-password \
       -H 'Content-Type: application/json' -d '{"email":"demo@girrituals.com"}')" \
    "POST /auth/forgot-password"

chk "$(curl -so /dev/null -w '%{http_code}' -X POST $BASE/auth/google \
       -H 'Content-Type: application/json' -d '{"accessToken":"fake"}')" \
    401 "POST /auth/google (fake token)"

chk "$(curl -so /dev/null -w '%{http_code}' -X POST $BASE/auth/apple \
       -H 'Content-Type: application/json' -d '{"identityToken":"fake"}')" \
    401 "POST /auth/apple (fake token)"

chk "$(curl -so /dev/null -w '%{http_code}' -X POST $BASE/auth/register \
       -H 'Content-Type: application/json' -d '{"email":"x@x.com","password":"weak"}')" \
    400 "POST /auth/register (weak password)"

ok  "$(curl -so /dev/null -w '%{http_code}' -b /tmp/gir_admin_cookies.txt \
       -X POST $BASE/auth/refresh -H 'Content-Type: application/json')" \
    "POST /auth/refresh (admin cookie)"

ok  "$(curl -so /dev/null -w '%{http_code}' \
       -X POST $BASE/auth/logout -H 'Content-Type: application/json')" \
    "POST /auth/logout"

echo ""
echo "===== USER (authenticated) ====="
ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/user/profile)" \
    "GET /user/profile"

ok  "$(curl -so /dev/null -w '%{http_code}' -X PUT \
       -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
       -d '{"firstName":"Demo","lastName":"Customer","phone":"9876543210"}' \
       $BASE/user/profile)" \
    "PUT /user/profile"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/user/wallet)" \
    "GET /user/wallet"

ok  "$(curl -so /dev/null -w '%{http_code}' -X POST \
       -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
       -d '{"amount":10}' $BASE/user/wallet/add)" \
    "POST /user/wallet/add (+10)"

chk "$(curl -so /dev/null -w '%{http_code}' -X POST \
       -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
       -d '{"amount":-10}' $BASE/user/wallet/add)" \
    400 "POST /user/wallet/add (negative)"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/user/statement)" \
    "GET /user/statement"

PM_RESP=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"type":"UPI","label":"Test UPI"}' $BASE/user/payment-methods)
NEW_PM=$(echo $PM_RESP | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [[ -n "$NEW_PM" ]]; then
  echo "  OK  POST /user/payment-methods (created $NEW_PM)"; ((PASS++))
else
  echo "  FAIL POST /user/payment-methods (no id in response)"; ((FAIL++))
fi

ok  "$(curl -so /dev/null -w '%{http_code}' -X PUT \
       -H "Authorization: Bearer $TOKEN" \
       $BASE/user/payment-methods/$NEW_PM/default)" \
    "PUT /user/payment-methods/:id/default"

ok  "$(curl -so /dev/null -w '%{http_code}' -X DELETE \
       -H "Authorization: Bearer $TOKEN" \
       $BASE/user/payment-methods/$NEW_PM)" \
    "DELETE /user/payment-methods/:id"

ok  "$(curl -so /dev/null -w '%{http_code}' -X POST \
       -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
       -d '{"currentPassword":"Demo@1234","newPassword":"Demo@12345"}' \
       $BASE/auth/change-password)" \
    "POST /auth/change-password"

ok  "$(curl -so /dev/null -w '%{http_code}' -X POST \
       -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
       -d '{"currentPassword":"Demo@12345","newPassword":"Demo@1234"}' \
       $BASE/auth/change-password)" \
    "POST /auth/change-password (restore)"

echo ""
echo "===== BILLS / ORDERS / SCHEDULE / RITUALS ====="
ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/bills)" \
    "GET /bills"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/orders)" \
    "GET /orders"

ok  "$(curl -so /dev/null -w '%{http_code}' -X PUT \
       -H "Authorization: Bearer $TOKEN" $BASE/orders/ord1/cancel)" \
    "PUT /orders/:id/cancel"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/schedule)" \
    "GET /schedule"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/notifications)" \
    "GET /notifications"

ok  "$(curl -so /dev/null -w '%{http_code}' -X PUT \
       -H "Authorization: Bearer $TOKEN" $BASE/notifications/read-all)" \
    "PUT /notifications/read-all"

ok  "$(curl -so /dev/null -w '%{http_code}' -X PUT \
       -H "Authorization: Bearer $TOKEN" $BASE/notifications/n1/read)" \
    "PUT /notifications/:id/read"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/rituals)" \
    "GET /rituals"

ok  "$(curl -so /dev/null -w '%{http_code}' -X POST \
       -H "Authorization: Bearer $TOKEN" $BASE/rituals/r1/pause)" \
    "POST /rituals/:id/pause"

ok  "$(curl -so /dev/null -w '%{http_code}' -X POST \
       -H "Authorization: Bearer $TOKEN" $BASE/rituals/r1/resume)" \
    "POST /rituals/:id/resume"

echo ""
echo "===== ADMIN ====="
ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" $BASE/admin/dashboard)" \
    "GET /admin/dashboard"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" \
       "$BASE/admin/customers?page=1&limit=10")" \
    "GET /admin/customers (paginated)"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" \
       $BASE/admin/customers/GR7K2M9X)" \
    "GET /admin/customers/:id (by clientId)"

chk "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" \
       $BASE/admin/customers/NOTEXIST)" \
    404 "GET /admin/customers/NOTEXIST"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" $BASE/admin/orders)" \
    "GET /admin/orders"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" $BASE/admin/billing)" \
    "GET /admin/billing"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" $BASE/admin/finance)" \
    "GET /admin/finance"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" $BASE/admin/analytics)" \
    "GET /admin/analytics"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" $BASE/admin/refunds)" \
    "GET /admin/refunds"

ok  "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $ADMIN_TOKEN" $BASE/admin/otp-logs)" \
    "GET /admin/otp-logs"

echo ""
echo "===== AUTH GUARDS ====="
chk "$(curl -so /dev/null -w '%{http_code}' $BASE/user/profile)" \
    401 "GET /user/profile (no token)"

chk "$(curl -so /dev/null -w '%{http_code}' $BASE/admin/dashboard)" \
    401 "GET /admin/dashboard (no token)"

chk "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/admin/dashboard)" \
    403 "GET /admin/dashboard (customer token)"

chk "$(curl -so /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" $BASE/admin/customers)" \
    403 "GET /admin/customers (customer token)"

echo ""
echo "====================================="
echo "  PASSED: $PASS   FAILED: $FAIL"
echo "====================================="
