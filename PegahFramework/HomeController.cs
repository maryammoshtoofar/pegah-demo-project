
using Microsoft.AspNetCore.Mvc;
using Signum.API.Filters;

namespace PegahFramework;

public class HomeController : Controller
{
    // GET: Default
    [SignumAllowAnonymous]
    public ActionResult Index()
    {
        return View("~/Index.cshtml");
    }
}
