"use client";

import * as React from "react";
import { Bm25Search } from "@acmexyz/bm25-search";

import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const data: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@yahoo.com",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "Abe45@gmail.com",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@gmail.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@gmail.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@hotmail.com",
  },
];

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const bmSearch = new Bm25Search("id");

export function DemoTable() {
  const bmSearch = new Bm25Search("id");
  const [filterValue, setFilterValue] = React.useState("");

  const columns = ["id", "amount", "email", "status"];
  const filteredData = React.useMemo(() => {
    if (!filterValue) {
      return data;
    }

    const bmSearch = new Bm25Search<Payment, "id">("id");
    bmSearch.addIndex("email");
    bmSearch.addIndex("amount");
    bmSearch.addIndex("id");
    bmSearch.addIndex("status");
    bmSearch.addDocuments(data);

    // Filter the data
    return bmSearch.search(filterValue).map((result) => result.document);
  }, [filterValue]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search documents..."
          value={filterValue}
          onChange={(event) => setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell key={row.id}>{row.id}</TableCell>
                  <TableCell key={row.id}>{row.amount}</TableCell>
                  <TableCell key={row.id}>{row.email}</TableCell>
                  <TableCell key={row.id}>{row.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
