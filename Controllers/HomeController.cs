using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.Json;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    [HttpGet]
    public IActionResult GetGreenStats()
    {
        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data", "CuChi_Green_2019_2025.geojson");
        if (!System.IO.File.Exists(filePath)) return NotFound();
        var json = System.IO.File.ReadAllText(filePath);
        return Content(json, "application/json");
    }
}