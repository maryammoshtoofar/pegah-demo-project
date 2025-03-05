﻿using Signum.Authorization;
using Signum.Authorization.ActiveDirectory;

namespace PegahFramework;

internal class PegahFrameworkAuthorizer : ActiveDirectoryAuthorizer
{
    public PegahFrameworkAuthorizer(Func<ActiveDirectoryConfigurationEmbedded> getConfig) : base(getConfig)
    {
    }

    public override void UpdateUserInternal(UserEntity user, IAutoCreateUserContext ctx)
    {
        base.UpdateUserInternal(user, ctx);

        //user.Mixin<UserADMixin>().FirstName = ctx.FirstName;
    }
}
