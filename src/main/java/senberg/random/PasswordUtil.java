package senberg.random;

import org.eclipse.jetty.util.security.Password;

// Random util to generate OBF passwords for https Jetty config.
public class PasswordUtil{
    public static void main(String[] args) {
        String[] arguments = new String[2];
        arguments[1] = "test";
        Password.main(arguments);
    }
}
