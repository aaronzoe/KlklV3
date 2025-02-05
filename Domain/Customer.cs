﻿using ServiceStack.DataAnnotations;

namespace Domain
{
    public class Customer
    {
        [AutoIncrement]
        public int ID { get; set; }
        public string Khqd { get; set; }
        public string Khmc { get; set; }
        public string Lxr { get; set; }
        public string Lxdh { get; set; }
        public string Shdz { get; set; }

        public string Qy { get; set; }
        [Ignore]
        public int OrderNum { get; set; }
        [Ignore]
        public decimal OrderAmount { get; set; }
    }

    public class CustomerReportModel
    {
        public int ID { get; set; }
        public string Khqd { get; set; }
        public string Khmc { get; set; }
        public string Lxr { get; set; }
        public string Lxdh { get; set; }
        public string Shdz { get; set; }

        public string Qy { get; set; }
      
        public int OrderNum { get; set; }
     
        public decimal OrderAmount { get; set; }
    }
}