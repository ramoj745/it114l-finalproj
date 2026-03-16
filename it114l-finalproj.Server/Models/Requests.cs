namespace it114l_finalproj.Server.Models;

public record LoginRequest(string Username, string Password);

public record BookAppointmentRequest(
    string FirstName,
    string LastName,
    string ContactNumber,
    string Email,
    int DentistID,
    int ServiceID,
    DateTime AppointmentDate,
    TimeSpan AppointmentTime
);

public record UpdateAppointmentRequest(
    int DentistID,
    int ServiceID,
    DateTime AppointmentDate,
    TimeSpan AppointmentTime,
    string Status
);

public record CreateDentistRequest(
    string FirstName,
    string LastName,
    string ContactNumber,
    string Email,
    string Specialization
);

public record UpdateDentistRequest(
    string FirstName,
    string LastName,
    string ContactNumber,
    string Email,
    string Specialization
);

public record CreateServiceRequest(
    string ServiceName,
    string Description,
    decimal Price
);

public record UpdateServiceRequest(
    string ServiceName,
    string Description,
    decimal Price
);

public record CreateAdminRequest(
    string Username,
    string Password
);
