exports.serviceAccount = {
    "type": process.ENV.FIREBASE_SERVICE_TYPE,
    "project_id": process.ENV.FIREBASE_PROJECT_ID,
    "private_key_id": process.ENV.FIREBASE_KEY_ID,
    "private_key": process.ENV.FIREBASE_PRIVATE_KEY,
    "client_email": process.ENV.FIREBASE_CLIENT_EMAIL,
    "client_id": process.ENV.FIREBASE_CLIENT_ID,
    "auth_uri": process.ENV.FIREBASE_AUTH_URI,
    "token_uri": process.ENV.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.ENV.FIREBASE_CLIENT_X509_CERT_URL,
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-u2xce%40lawtrella-prod.iam.gserviceaccount.com"
}