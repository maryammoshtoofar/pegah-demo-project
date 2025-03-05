﻿using Microsoft.AspNetCore.Mvc;
using Signum.Authorization;
using PegahFramework.Employees;
using PegahFramework.Globals;
using PegahFramework.Customers;
using Signum.API.Filters;
using System.ComponentModel.DataAnnotations;

namespace PegahFramework.Public;

public class PublicController : ControllerBase
{
    [Route("api/getRegisterUser"), HttpPost, SignumAllowAnonymous]
    public RegisterUserModel GetRegisterUser(string? reportsToEmployeeId = null)
    {
        using (AuthLogic.Disable())
        {
            var company = reportsToEmployeeId.HasText() ? Database.RetrieveLite<EmployeeEntity>(PrimaryKey.Parse(reportsToEmployeeId, typeof(EmployeeEntity))) : null;
            return new RegisterUserModel
            {
                ReportsTo = company,
                Address = new AddressEmbedded(),
            };
        }
    }

    [Route("api/registerUser"), HttpPost, SignumAllowAnonymous, ValidateModelFilter]
    public void RegisterUser([FromBody, Required]RegisterUserModel model)
    {
        using (UserHolder.UserSession(AuthLogic.SystemUser!))
        {
            var role = Database.Query<RoleEntity>().SingleEx(a => a.Name == "Standard user").ToLite();

            if (Database.Query<UserEntity>().Any(a => a.UserName == model.EMail))
                throw new ApplicationException(RegisterUserMessage.User0IsAlreadyRegistered.NiceToString(model.EMail));


            var employee = new EmployeeEntity
            {
                TitleOfCourtesy = model.TitleOfCourtesy,
                FirstName = model.FirstName,
                LastName = model.LastName,
                ReportsTo = model.ReportsTo,
                Address = model.Address,
            }.Execute(EmployeeOperation.Save);

            new UserEntity
            {
                UserName = model.EMail,
                PasswordHash = PasswordEncoding.EncodePassword(model.Username, model.Password),
                Email = model.EMail,
                Role = role,
            }.InitiMixin((UserEmployeeMixin um) =>
            {
                um.Employee = employee.ToLite();
            }).Execute(UserOperation.Save);
        }
    }
}
