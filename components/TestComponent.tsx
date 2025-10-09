// "use client";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { useRouter } from "next/navigation";

// export default function TestComponent() {
//   const router = useRouter();

//   return (
//     <Link
//       className="w-50 h-20 bg-secondary flex items-center justify-center"
//       href={"https://devhub.co.in"}
//       target="_blank"
//       //   onClick={() => router.push("https://devhub.co.in")}
//     >
//       <PropagationStopper>
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button
//               variant="outline"
//               onClick={(e) => {
//                 //   e.preventDefault();
//                 // e.stopPropagation();
//               }}
//             >
//               Open Dialog
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Dialog Title</DialogTitle>
//               <DialogDescription>
//                 This is a shadcn dialog inside a Next.js Link.
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button type="button">Close</Button>
//               </DialogClose>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </PropagationStopper>
//     </Link>
//   );
// }
