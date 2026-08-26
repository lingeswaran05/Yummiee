package com.yummiee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class YummieeApplication {

    public static void main(String[] args) {
        ensureDatabaseDirectory();
        SpringApplication.run(YummieeApplication.class, args);
    }

    private static void ensureDatabaseDirectory() {
        String dbPath = System.getenv("YUMMIEE_DB_PATH");
        if (dbPath == null || dbPath.trim().isEmpty()) {
            dbPath = "./data/yummiee.db";
        }
        File dbFile = new File(dbPath);
        File parentDir = dbFile.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            boolean created = parentDir.mkdirs();
            if (created) {
                System.out.println("Created SQLite database directory: " + parentDir.getAbsolutePath());
            }
        }
    }
}
