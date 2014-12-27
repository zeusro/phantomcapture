using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace NodeDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            Process p = new Process();
            p.StartInfo.FileName = "cmd.exe";
            p.StartInfo.UseShellExecute = false;
            p.StartInfo.RedirectStandardInput = true;
            p.StartInfo.RedirectStandardOutput = true;
            p.StartInfo.RedirectStandardError = true;
            p.StartInfo.CreateNoWindow = true;
            p.Start();
            string strOutput = null;
            p.StandardInput.WriteLine(string.Format(@"node  F:\NodeMain.js"));
            strOutput = p.StandardOutput.ReadToEnd();
            Console.WriteLine(strOutput);
            p.WaitForExit();
            p.Close();
            Console.ReadKey();
        }
    }
}
