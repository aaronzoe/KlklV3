﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ServiceStack;
using Klkl.ServiceModel;

namespace Klkl.ServiceInterface
{
    public class MyServices : Service
    {
        public object Any(Hello request)
        {
            return new HelloResponse {Result = "Hello, {0}!".Fmt(request.Name)};
        }
    }
}