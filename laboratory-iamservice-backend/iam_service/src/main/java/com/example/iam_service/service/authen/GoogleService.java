package com.example.iam_service.service.authen;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

public interface GoogleService {
    GoogleIdToken.Payload getPayload(String tokenId);

    GoogleIdToken verifyGoogleCredential(String tokenId);
}
