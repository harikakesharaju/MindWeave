package com.myProjects.mindWeave.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myProjects.mindWeave.dto.StreakDto;
import com.myProjects.mindWeave.services.StreakService;

@RestController
@RequestMapping("/api/streaks")
public class StreakController {

    @Autowired
    private StreakService streakService;

    @GetMapping("/users/{user1Id}/{user2Id}")
    public ResponseEntity<StreakDto> getStreakBetweenUsers(@PathVariable Long user1Id, @PathVariable Long user2Id) {
        StreakDto streakDto = streakService.getStreakByUserPair(user1Id, user2Id);
        if (streakDto != null) {
            return new ResponseEntity<>(streakDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    
    @PostMapping("/daily-check")
    public ResponseEntity<Void> runDailyStreakCheck() {
        streakService.checkAndResetDailyStreaks();
        return ResponseEntity.ok().build();
    }

}