// src/app/admin/users/page.tsx
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });


  // console.log('users data: ',users);
  // const users = [{id:1,avatar:null,createdAt:new Date(),email:'test@mail.com',isActive:true,name:'user_name_1', password:'****',roleId:1 ,updatedAt:new Date(), role: {name:'role_1'}}]
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Users
        </h1>
        <Link href="/admin/user/new" className="btn-primary text-sm">
          + New User
        </Link>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">User</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Role</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Joined</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-4">
                  <div>
                    <p className="text-slate-200 font-medium text-sm">{user.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
                  </div>
                </td>
                <td className="py-4">
                  <span className="badge bg-slate-700 text-slate-300 capitalize">{user.role.name}</span>
                </td>
                <td className="py-4">
                  <span className={`badge ${user.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4 text-slate-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString("th-TH")}
                </td>
                <td className="py-4 text-right">
                  <Link href={`/admin/user/${user.id}/edit`} className="text-sky-400 hover:text-sky-300 text-sm mr-4">
                    Edit
                  </Link>
                  <DeleteUserButton key={user.id} userId={user.id} userName={user.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
