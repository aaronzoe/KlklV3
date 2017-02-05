﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Klkl.ServiceModel;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.DataAnnotations;
using ServiceStack.OrmLite;

namespace Klkl.ServiceInterface
{
    public class AccountService:Service
    {
        [Authenticate]
        public object Get(AccountInfo request)
        {
          var user=   Db.SingleById<UserAuth>(GetSession().UserAuthId);
            return user;
        }

       
    }
}
