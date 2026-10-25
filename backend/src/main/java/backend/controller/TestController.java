package backend.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

  @GetMapping("/api/test")
  public String test() {
    return "You are authenticated!";
  }

  @GetMapping("/api/me")
  public String me() {
    return SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();
  }
}
