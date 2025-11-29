//package com.myProjects.mindWeave.config; // Adjust package name
//
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import java.util.Date;
//import java.util.HashMap;
//import java.util.Map;
//
//@Component
//public class JwtUtil {
//
//    @Value("${jwt.secret}")
//    private String secret;
//
//    @Value("${jwt.expiration}")
//    private long expiration;
//
//    public String generateToken(String email) {
//        Map<String, Object> claims = new HashMap<>();
//        return createToken(claims, email);
//    }
//
//    private String createToken(Map<String, Object> claims, String subject) {
//        return Jwts.builder()
//                .setClaims(claims)
//                .setSubject(subject)
//                .setIssuedAt(new Date(System.currentTimeMillis()))
//                .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
//                .signWith(SignatureAlgorithm.HS256, secret)
//                .compact();
//    }
//
//    public String extractSubject(String token) {
//        try {
//            return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody().getSubject();
//        } catch (Exception e) {
//            return null;
//        }
//    }
//
//    public boolean isTokenExpired(String token) {
//        try {
//            return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody().getExpiration().before(new Date());
//        } catch (Exception e) {
//            return true; // Consider invalid tokens as expired
//        }
//    }
//
//    // You might want to add methods to extract other claims if needed
//}