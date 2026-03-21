using System.Threading.Tasks;

namespace it114l_finalproj.Server.Services
{
    public interface IEmailSender
    {
        Task SendAsync(string toEmail, string subject, string htmlBody);
    }
}