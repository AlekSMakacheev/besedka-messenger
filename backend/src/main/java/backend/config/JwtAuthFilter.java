package backend.config;


import backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthFilter extends org.springframework.web.filter.OncePerRequestFilter {

  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {


    System.out.println("REQUEST: " + request.getRequestURI());

    String header = request.getHeader("Authorization");
    System.out.println("HEADER: " + header);

    if(header == null || !header.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = header.substring(7);

    try {
      String username = jwtService.extractUsername(token);

      var auth = new UsernamePasswordAuthenticationToken(
              username,
              null,
              new ArrayList<>()
      );

      SecurityContextHolder.getContext().setAuthentication(auth);
    } catch (Exception e) {
      System.out.println("JWT error: " + e.getMessage());
    }

    filterChain.doFilter(request, response);

    String username = jwtService.extractUsername(token);

    System.out.println("JWT USER = " + username);

  }



}
