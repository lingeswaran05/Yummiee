package com.yummiee.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.io.File;

@Configuration
public class DatabaseConfig {

    public DatabaseConfig(Environment environment) {
        String datasourceUrl = environment.getProperty("spring.datasource.url");
        if (datasourceUrl != null && datasourceUrl.startsWith("jdbc:sqlite:")) {
            String dbPath = datasourceUrl.substring("jdbc:sqlite:".length());
            int queryIndex = dbPath.indexOf('?');
            if (queryIndex != -1) {
                dbPath = dbPath.substring(0, queryIndex);
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
}
