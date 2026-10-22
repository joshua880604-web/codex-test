"use client";
import dynamic from "next/dynamic";
// Keep server-rendered form/result HTML; only this page's UI chunk is requested.
export default dynamic(() => import("./CalculatorClient"));
