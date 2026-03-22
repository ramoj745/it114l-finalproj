namespace it114l_finalproj.Server.Models
{
    public class Appointment
    {
        public int AppointmentID { get; set; }
        public int PatientID { get; set; }
        public int? DentistID { get; set; }
        public int ServiceID { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public string Status { get; set; } = "Pending";
        public string? ConfirmationCode { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class AppointmentDetail
    {
        public int AppointmentID { get; set; }
        public int PatientID { get; set; }

        public string PatientFirstName { get; set; } = "";
        public string PatientLastName { get; set; } = "";
        public string PatientEmail { get; set; } = "";

        public int? DentistID { get; set; }
        public string DentistFirstName { get; set; } = "";
        public string DentistLastName { get; set; } = "";

        public int ServiceID { get; set; }
        public string ServiceName { get; set; } = "";

        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }

        public string Status { get; set; } = "Pending";
        public string? ConfirmationCode { get; set; }
        public bool IsDeleted { get; set; }

        public int DisplayNumber { get; set; }
        public string AppointmentTimeDisplay { get; set; } = "";
    }
}