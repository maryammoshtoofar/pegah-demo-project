﻿using Signum.API;

namespace PegahFramework.Public;

public static class PublicLogic
{
    public static void Start(SchemaBuilder sb)
    {
        if (sb.NotDefined(MethodBase.GetCurrentMethod()))
        {
            if (sb.WebServerBuilder != null)
                ReflectionServer.RegisterLike(typeof(RegisterUserModel), () => true);
        }
    }
}
