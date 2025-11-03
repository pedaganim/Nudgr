package com.example.invoice.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Date;
import java.util.Properties;

/**
 * Service for sending emails via Gmail API using user's OAuth2 token.
 */
@Service
public class GmailEmailService {

    private final OAuth2AuthorizedClientService authorizedClientService;

    public GmailEmailService(OAuth2AuthorizedClientService authorizedClientService) {
        this.authorizedClientService = authorizedClientService;
    }

    /**
     * Send email using Gmail API with user's OAuth2 credentials.
     */
    public void sendEmail(String principalName, String to, String subject, String body) 
            throws GeneralSecurityException, IOException, MessagingException {
        
        // Get OAuth2 authorized client for the user
        OAuth2AuthorizedClient client = authorizedClientService
            .loadAuthorizedClient("google", principalName);
        
        if (client == null) {
            throw new IllegalStateException("User is not authenticated with Google");
        }

        OAuth2AccessToken accessToken = client.getAccessToken();
        if (accessToken == null || accessToken.getTokenValue() == null) {
            throw new IllegalStateException("No valid access token found");
        }

        // Create Gmail service with user's credentials
        GoogleCredentials credentials = GoogleCredentials.create(
            new AccessToken(accessToken.getTokenValue(), 
                           accessToken.getExpiresAt() != null ? 
                           Date.from(accessToken.getExpiresAt()) : null)
        );

        Gmail service = new Gmail.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance(),
            new HttpCredentialsAdapter(credentials))
            .setApplicationName("Invoice Service")
            .build();

        // Create email message
        MimeMessage email = createEmail(to, "me", subject, body);
        Message message = createMessageWithEmail(email);

        // Send email
        service.users().messages().send("me", message).execute();
    }

    /**
     * Create a MimeMessage using the parameters provided.
     */
    private MimeMessage createEmail(String to, String from, String subject, String bodyText)
            throws MessagingException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setText(bodyText);
        return email;
    }

    /**
     * Create a message from an email.
     */
    private Message createMessageWithEmail(MimeMessage emailContent)
            throws MessagingException, IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        emailContent.writeTo(buffer);
        byte[] bytes = buffer.toByteArray();
        String encodedEmail = Base64.getUrlEncoder().encodeToString(bytes);
        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }
}
