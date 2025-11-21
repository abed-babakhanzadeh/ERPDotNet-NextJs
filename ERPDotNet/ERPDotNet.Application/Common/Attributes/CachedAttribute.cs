using System;

namespace ERPDotNet.Application.Common.Attributes;

[AttributeUsage(AttributeTargets.Class)] // روی کلاس‌های Query قرار می‌گیرد
public class CachedAttribute : Attribute
{
    public int TimeToLiveSeconds { get; }
    public CachedAttribute(int timeToLiveSeconds = 60)
    {
        TimeToLiveSeconds = timeToLiveSeconds;
    }
}