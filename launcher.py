import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import subprocess
import socket
import os
import signal
import sys
import atexit
import threading
import queue

class LauncherApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Companion Bot Launcher")
        self.root.geometry("600x500")
        self.root.configure(padx=10, pady=10)
        
        self.processes = []
        self.is_running = False
        
        # Get local IP
        self.local_ip = self.get_local_ip()
        
        # UI Setup
        self.setup_ui()
        
        atexit.register(self.stop_services)
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def get_local_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def setup_ui(self):
        # Header Frame
        header_frame = ttk.Frame(self.root)
        header_frame.pack(fill="x", pady=(0, 10))
        
        title_label = ttk.Label(header_frame, text="Companion Bot", font=("Segoe UI", 20, "bold"))
        title_label.pack(side="left")
        
        self.status_label = ttk.Label(header_frame, text="Status: Stopped", font=("Segoe UI", 12), foreground="gray")
        self.status_label.pack(side="right", pady=5)
        
        # IP Frame
        ip_frame = ttk.LabelFrame(self.root, text="Mobile Connection IP", padding=10)
        ip_frame.pack(fill="x", pady=5)
        self.ip_label = ttk.Label(ip_frame, text=self.local_ip, font=("Consolas", 14, "bold"), foreground="#007ACC")
        self.ip_label.pack()
        
        # Controls Frame
        controls_frame = ttk.Frame(self.root)
        controls_frame.pack(fill="x", pady=10)
        
        self.toggle_btn = ttk.Button(controls_frame, text="▶ START ALL SERVICES", command=self.toggle_services, style="Primary.TButton")
        self.toggle_btn.pack(fill="x", ipady=8)
        
        # Notebook (Tabs) for Logs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, pady=5)
        
        # API Log Tab
        self.api_log_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.api_log_frame, text="API Logs")
        self.api_text = scrolledtext.ScrolledText(self.api_log_frame, font=("Consolas", 9), bg="#1e1e1e", fg="#d4d4d4", state="disabled")
        self.api_text.pack(fill="both", expand=True)
        
        # Dashboard Log Tab
        self.dash_log_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.dash_log_frame, text="Dashboard Logs")
        self.dash_text = scrolledtext.ScrolledText(self.dash_log_frame, font=("Consolas", 9), bg="#1e1e1e", fg="#d4d4d4", state="disabled")
        self.dash_text.pack(fill="both", expand=True)

        # Qdrant Log Tab
        self.qdrant_log_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.qdrant_log_frame, text="System Events")
        self.system_text = scrolledtext.ScrolledText(self.qdrant_log_frame, font=("Consolas", 9), bg="#1e1e1e", fg="#d4d4d4", state="disabled")
        self.system_text.pack(fill="both", expand=True)

        # Styles
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Primary.TButton", font=("Segoe UI", 12, "bold"), background="#0078D7", foreground="white")
        style.map("Primary.TButton", background=[("active", "#005A9E")])

    def append_log(self, text_widget, msg):
        def _append():
            text_widget.config(state="normal")
            text_widget.insert(tk.END, msg)
            text_widget.see(tk.END)
            text_widget.config(state="disabled")
        self.root.after(0, _append)

    def log_system(self, msg):
        self.append_log(self.system_text, msg + "\n")

    def read_stream(self, stream, text_widget):
        try:
            for line in iter(stream.readline, ''):
                if line:
                    self.append_log(text_widget, line)
        except Exception:
            pass
        finally:
            stream.close()

    def toggle_services(self):
        if self.is_running:
            self.stop_services()
            self.toggle_btn.config(text="▶ START ALL SERVICES", style="Primary.TButton")
            self.status_label.config(text="Status: Stopped", foreground="gray")
            self.is_running = False
            self.log_system("Services stopped.")
        else:
            self.api_text.config(state="normal")
            self.api_text.delete(1.0, tk.END)
            self.api_text.config(state="disabled")
            self.dash_text.config(state="normal")
            self.dash_text.delete(1.0, tk.END)
            self.dash_text.config(state="disabled")
            
            self.start_services()
            
            self.toggle_btn.config(text="■ STOP ALL SERVICES", style="Primary.TButton")
            self.status_label.config(text="Status: Running", foreground="green")
            self.is_running = True
            self.log_system("Services starting...")

    def start_services(self):
        cwd = os.path.dirname(os.path.abspath(__file__))
        
        # 1. Start Qdrant
        try:
            self.log_system("Starting Qdrant...")
            subprocess.Popen(["docker", "compose", "up", "-d"], cwd=cwd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            self.log_system(f"Warning: Failed to start Qdrant via Docker: {e}")
            messagebox.showwarning("Docker Warning", "Could not start Qdrant automatically. Make sure Docker Desktop is running.")

        # 2. Start API Backend
        try:
            self.log_system("Starting API Backend...")
            api_proc = subprocess.Popen(
                [sys.executable, "-m", "uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"],
                cwd=cwd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )
            self.processes.append(api_proc)
            threading.Thread(target=self.read_stream, args=(api_proc.stdout, self.api_text), daemon=True).start()
        except Exception as e:
            messagebox.showerror("Backend Error", f"Failed to start Python API: {e}")
            self.stop_services()
            return

        # 3. Start Dashboard
        try:
            self.log_system("Starting Dashboard...")
            dashboard_cwd = os.path.join(cwd, "apps", "dashboard")
            dash_proc = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=dashboard_cwd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )
            self.processes.append(dash_proc)
            threading.Thread(target=self.read_stream, args=(dash_proc.stdout, self.dash_text), daemon=True).start()
        except Exception as e:
            messagebox.showerror("Frontend Error", f"Failed to start React Dashboard: {e}")
            self.stop_services()
            return

    def stop_services(self):
        for p in self.processes:
            try:
                if os.name == 'nt':
                    subprocess.call(['taskkill', '/F', '/T', '/PID', str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    os.killpg(os.getpgid(p.pid), signal.SIGTERM)
            except Exception as e:
                self.log_system(f"Failed to kill process {p.pid}: {e}")
        self.processes.clear()

    def on_close(self):
        self.stop_services()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = LauncherApp(root)
    root.mainloop()
