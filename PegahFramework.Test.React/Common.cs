﻿using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using Microsoft.Extensions.Configuration;
using System.IO;
using Signum.Selenium;

namespace PegahFramework.Test.React;

public class PegahFrameworkTestClass
{
    public static string BaseUrl { get; private set; }

    static PegahFrameworkTestClass()
    {
        var config = new ConfigurationBuilder()
             .SetBasePath(Directory.GetCurrentDirectory())
             .AddJsonFile("appsettings.json")
             .AddJsonFile($"appsettings.{System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", true)
             .AddUserSecrets(typeof(PegahFrameworkTestClass).Assembly)
             .Build();

        BaseUrl = config["Url"]!;
    }

    public static void Browse(string username, Action<PegahFrameworkBrowser> action)
    {
        var selenium = new ChromeDriver("../../../");

        var browser = new PegahFrameworkBrowser(selenium);
        try
        {
            browser.Login(username, username);
            action(browser);
        }
        catch (UnhandledAlertException)
        {
            selenium.SwitchTo().Alert();

        }
        finally
        {
            selenium.Close();
        }
    }
}

public class PegahFrameworkBrowser : BrowserProxy
{
    public override string Url(string url)
    {
        return PegahFrameworkTestClass.BaseUrl + url;
    }

    public PegahFrameworkBrowser(WebDriver driver)
        : base(driver)
    {
    }

    public override void Login(string username, string password)
    {
        base.Login(username, password);

        string culture = Selenium.FindElement(By.Id("languageSelector")).SelectElement().SelectedOption.GetAttribute("value");

        Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture = new CultureInfo(culture);
    }

}
