"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../../core/context/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  // Mock statistics matching user stories
  const stats = [
    {
      title: "Tổng số sinh viên",
      value: "1,280",
      change: "+4.2% tháng này",
      color: "border-l-primary bg-primary/5 text-primary",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      )
    },
    {
      title: "Văn bằng đã cấp",
      value: "956",
      change: "100% On-chain verified",
      color: "border-l-teal-600 bg-teal-500/5 text-teal-600 dark:text-teal-400",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
      )
    },
    {
      title: "Chờ ghi Blockchain",
      value: "12",
      change: "Yêu cầu xử lý lại",
      color: "border-l-warning bg-amber-500/5 text-warning",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      title: "Đã thu hồi",
      value: "2",
      change: "Sai lệch thông tin",
      color: "border-l-danger bg-red-500/5 text-danger",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
        </svg>
      )
    }
  ];

  // Mock transactions list
  const recentTransactions = [
    {
      id: "tx-1",
      txHash: "0x71c7...976f",
      studentName: "Nguyễn Văn Hùng",
      credentialType: "Bằng cử nhân CNTT",
      time: "10 phút trước",
      status: "Success",
    },
    {
      id: "tx-2",
      txHash: "0x4ae8...339a",
      studentName: "Lê Thị Thu",
      credentialType: "Chứng chỉ tiếng Anh",
      time: "2 giờ trước",
      status: "Success",
    },
    {
      id: "tx-3",
      txHash: "0x12cf...f0b3",
      studentName: "Phạm Hoàng Minh",
      credentialType: "Bằng thạc sĩ CNTT",
      time: "1 ngày trước",
      status: "Success",
    },
    {
      id: "tx-4",
      txHash: "0xfa49...cc88",
      studentName: "Vũ Phương Thảo",
      credentialType: "Bằng cử nhân Điện tử",
      time: "3 ngày trước",
      status: "Success",
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header welcome block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Tổng quan Hệ thống
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Chào mừng đại diện trường **{user?.orgName || "HUST"}** quay trở lại cổng quản trị.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/credentials/create"
            className="px-5 py-3 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
            </svg>
            Cấp bằng đơn lẻ
          </Link>
          <Link
            href="/admin/batches"
            className="px-5 py-3 text-xs font-bold text-primary dark:text-teal-400 bg-white dark:bg-gray-800 hover:bg-slate-50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            Cấp bằng hàng loạt
          </Link>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`border-l-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 p-6 flex items-center justify-between shadow-sm transition-all hover:-translate-y-0.5 ${stat.color}`}
          >
            <div className="space-y-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{stat.title}</span>
              <span className="block text-2xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</span>
              <span className="block text-[11px] font-semibold text-gray-450 dark:text-gray-500">{stat.change}</span>
            </div>
            <div className="p-3 bg-gray-55 dark:bg-gray-800/40 rounded-xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Widgets: Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
              Giao dịch Blockchain gần đây
            </h2>
            <Link
              href="/admin/blockchain"
              className="text-xs font-bold text-primary hover:text-primary-hover dark:text-teal-400 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-850 pb-3 text-xs text-gray-500">
                  <th className="py-3 font-semibold">Mã giao dịch</th>
                  <th className="py-3 font-semibold">Sinh viên</th>
                  <th className="py-3 font-semibold">Loại bằng</th>
                  <th className="py-3 font-semibold">Thời gian</th>
                  <th className="py-3 font-semibold text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-xs">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 font-mono font-bold text-primary dark:text-teal-400">{tx.txHash}</td>
                    <td className="py-4 font-semibold text-gray-800 dark:text-gray-200">{tx.studentName}</td>
                    <td className="py-4 text-gray-500 dark:text-gray-400">{tx.credentialType}</td>
                    <td className="py-4 text-gray-450 dark:text-gray-500">{tx.time}</td>
                    <td className="py-4 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-bold border border-green-200/50">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Widgets: Operations Quick Panel */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4">
              Thao tác nhanh
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin/students"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-150 dark:border-gray-850 bg-slate-50/50 hover:bg-primary/5 dark:bg-slate-900/50 dark:hover:bg-teal-950/20 hover:border-primary/30 transition-all text-xs font-semibold group"
              >
                <span>Nhập danh sách sinh viên</span>
                <svg className="w-4 h-4 text-gray-450 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
              <Link
                href="/admin/templates"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-150 dark:border-gray-850 bg-slate-50/50 hover:bg-primary/5 dark:bg-slate-900/50 dark:hover:bg-teal-950/20 hover:border-primary/30 transition-all text-xs font-semibold group"
              >
                <span>Thiết kế mẫu bằng mới</span>
                <svg className="w-4 h-4 text-gray-450 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
              <Link
                href="/admin/revocations"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-150 dark:border-gray-850 bg-slate-50/50 hover:bg-danger/5 dark:bg-slate-900/50 dark:hover:bg-red-950/10 hover:border-danger/30 transition-all text-xs font-semibold group"
              >
                <span className="text-danger">Yêu cầu thu hồi bằng</span>
                <svg className="w-4 h-4 text-danger/70 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Connection status monitoring widget */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-3">Kết nối hạ tầng</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Node RPC:</span>
                <span className="font-semibold text-green-400">Đã kết nối (12ms)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">IPFS Cluster:</span>
                <span className="font-semibold text-green-400">Hoạt động (99.8%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Smart Contract:</span>
                <span className="font-mono text-slate-350 bg-slate-800 px-2 py-0.5 rounded">0x3b82...b65f</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
