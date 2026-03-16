namespace it114l_finalproj.Server.Models;

public class Patient
{
    public int PatientID { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string ContactNumber { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime DateCreated { get; set; }
}
