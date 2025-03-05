using System.IO;
using System.Xml.Linq;
using Signum.Authorization;
using Signum.Engine.Maps;
using Signum.Engine.Sync;
using PegahFramework;

namespace PegahFramework.Test.Environment;

public class EnvironmentTest
{
    [Fact]
    public void GenerateTestEnvironment()
    {
        var authRules = XDocument.Load(@"..\..\..\..\PegahFramework.Terminal\AuthRules.xml");

        PegahFrameworkEnvironment.Start(includeDynamic: false);

        Administrator.TotalGeneration();

        Schema.Current.Initialize();

        OperationLogic.AllowSaveGlobally = true;

        using (AuthLogic.Disable())
        {
            AuthLogic.LoadRoles(authRules);
            PegahFrameworkEnvironment.LoadBasics();
            PegahFrameworkEnvironment.LoadEmployees();
            PegahFrameworkEnvironment.LoadUsers();
            PegahFrameworkEnvironment.LoadProducts();
            PegahFrameworkEnvironment.LoadCustomers();
            PegahFrameworkEnvironment.LoadShippers();
            
            AuthLogic.ImportRulesScript(authRules, interactive: false)!.PlainSqlCommand().ExecuteLeaves();
        }

        OperationLogic.AllowSaveGlobally = false;
    }
}
