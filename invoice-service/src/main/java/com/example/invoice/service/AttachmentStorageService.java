package com.example.invoice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class AttachmentStorageService {
    private final Path root;

    public AttachmentStorageService(@Value("${app.uploads.dir:uploads}") String uploadsDir) throws IOException {
        this.root = Paths.get(uploadsDir).toAbsolutePath().normalize();
        Files.createDirectories(this.root);
    }

    public String save(String filename, InputStream content) throws IOException {
        String safe = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path target = root.resolve(System.currentTimeMillis() + "_" + safe);
        Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
        return target.toString();
    }

    public Path load(String storageKey) {
        return Paths.get(storageKey);
    }

    public void delete(String storageKey) throws IOException {
        Files.deleteIfExists(load(storageKey));
    }
}
