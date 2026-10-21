{/* <Input
  type="file"
  accept=".jpg,.jpeg,.png,.pdf"
  maxFileSize={5 * 1024 * 1024}
  onInvalidFile={() => {
    Swal.fire({
      // title: "File Too Large",
      text: "Document size must not exceed 5 MB.",
      confirmButtonColor: "#1e3a8a",
    });

    setDocumentFiles((prev) => {
      const updatedFiles = { ...prev };
      delete updatedFiles[document.DOCID];
      return updatedFiles;
    });
  }}
  onChange={(e) =>
    handleDocumentFileChange(
      document.DOCID,
      e.target.files?.[0] || null
    )
  }
  className="cursor-pointer"
/> */}



import { cn } from "@/lib/utils";
import Swal from "sweetalert2";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_FILE_ACCEPT = ".jpg,.jpeg,.png,.pdf";

function Input({
  className,
  type = "text",
  accept = type === "file" ? DEFAULT_FILE_ACCEPT : undefined,
  maxFileSize = type === "file" ? DEFAULT_MAX_FILE_SIZE : undefined,
  onChange,
  onInvalidFile = () => {
    Swal.fire({ text: "Document size must not exceed 5 MB.", confirmButtonColor: "#1e3a8a" });
  },
  onInvalidFileType = () => {
    Swal.fire({ text: "Only PDF, JPG, and PNG file formats are allowed.", confirmButtonColor: "#1e3a8a" });
  },
  ...props
}) {

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (type === "file" && file) {
      if (maxFileSize && file.size > maxFileSize) {
        // Clear browser's selected file name
        e.target.value = "";
        onInvalidFile?.(file);
        return;
      }

      if (accept) {
        const allowedList = accept.split(",").map((s) => s.trim().toLowerCase());
        const fileName = (file.name || "").toLowerCase();
        const fileType = (file.type || "").toLowerCase();

        const isAllowed = allowedList.some((allowed) => {
          if (allowed.startsWith(".")) {
            return fileName.endsWith(allowed);
          }
          if (allowed.endsWith("/*")) {
            return fileType.startsWith(allowed.replace("/*", ""));
          }
          return fileType === allowed;
        });

        if (!isAllowed) {
          e.target.value = "";
          onInvalidFileType?.(file);
          return;
        }
      }
    }

    onChange?.(e);
  };

  /* ---------- RADIO / CHECKBOX ---------- */
  if (type === "radio" || type === "checkbox") {
    return (
      <input
        type={type}
        data-slot="input"
         onChange={onChange}   
        className={cn(
          "h-4 w-4 cursor-pointer   accent-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          type === "radio" && "rounded-full",
          className
        )}
        {...props}
      />
    );
  }

  /* ---------- DEFAULT TEXT INPUT ---------- */
  return (
    <input
      type={type}
      data-slot="input"
      accept={type === "file" ? accept : undefined}
      //     min="0"
      // step="1"
      onChange={type === "file" ? handleFileChange : onChange}
      onKeyDown={(e) => {
        if (type === "number" && ["-", "e", "+", "*", "/"].includes(e.key)) {
          e.preventDefault();
        }
        else if (["#", "*", "$", "^", "*", "!", "+"].includes(e.key)) {
          e.preventDefault();
        }
      }}
      onWheel={type === "number" ? (e) => e.currentTarget.blur() : undefined}

      className={cn(
        "file:text-foreground  disabled:text-slate-900  disabled:border disabled:border-gray-400 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border border-gray-400  bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input };