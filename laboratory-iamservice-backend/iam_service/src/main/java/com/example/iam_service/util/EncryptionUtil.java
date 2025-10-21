package com.example.iam_service.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class EncryptionUtil {
    private static final String ALGORITHM = "AES";

    private static String getSecretKey() {
        String key = System.getenv("APP_ENCRYPTION_KEY");
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("APP_ENCRYPTION_KEY is not set in environment variables");
        }
        if (key.length() != 16) {
            throw new IllegalStateException("APP_ENCRYPTION_KEY must be 16 characters long for AES-128");
        }
        return key;
    }

    public static String encrypt(String value) {
        if (value == null) return null;

        try {
            SecretKeySpec key = new SecretKeySpec(getSecretKey().getBytes(), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encryptedValue = cipher.doFinal(value.getBytes());
            return Base64.getEncoder().encodeToString(encryptedValue);
        } catch (Exception e) {
            throw new RuntimeException("Error while encrypting: ", e);
        }
    }

    public static String decrypt(String value) {
        if (value == null) return null;
        try {
            SecretKeySpec key = new SecretKeySpec(getSecretKey().getBytes(), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decoded = Base64.getDecoder().decode(value);
            byte[] decryptedValue = cipher.doFinal(decoded);
            return new String(decryptedValue);
        } catch (Exception e) {
            // fallback — data is probably plaintext, not encrypted yet
            return value;
        }
    }
}
