package com.myProjects.mindWeave.config;

import java.sql.Connection;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements ApplicationRunner {

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            /*
             * If profile_image was previously stored as OID (via @Lob), Hibernate
             * throws "Large Objects may not be used in auto-commit mode" at login.
             * This one-time migration converts the column to BYTEA so the byte[]
             * entity field works correctly.  Existing OID data is cleared (users
             * must re-upload their profile images).
             */
            stmt.execute("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM   pg_catalog.pg_attribute  a
                        JOIN   pg_catalog.pg_class       c ON c.oid = a.attrelid
                        JOIN   pg_catalog.pg_type        t ON t.oid = a.atttypid
                        WHERE  c.relname   = 'users'
                          AND  a.attname   = 'profile_image'
                          AND  t.typname   = 'oid'
                          AND  a.attnum    > 0
                          AND  NOT a.attisdropped
                    ) THEN
                        ALTER TABLE users
                            ALTER COLUMN profile_image TYPE bytea USING NULL;
                    END IF;
                END $$;
            """);
        }
    }
}
