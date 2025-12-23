
import random
import time
from reserve_voucher import reserve_voucher
from confirm_voucher import confirm_voucher

def simulate_sales(count=10):
    print(f"🎬 Starting simulation of {count} sales...")
    
    successful_sales = 0
    
    for i in range(count):
        print(f"\n--- Sale #{i+1} ---")
        
        # 1. Reserve
        uuid = reserve_voucher(timeout_seconds=60)
        
        if not uuid:
            print("⚠️ Stopped simulation: No more vouchers available.")
            break
            
        # Simulate user thinking time
        time.sleep(0.1)
        
        # 2. Generate Ticket ID
        ticket_id = f"TICKET-{random.randint(10000, 99999)}"
        
        # 3. Confirm
        if confirm_voucher(uuid, ticket_id):
            successful_sales += 1
            
    print(f"\n🎉 Simulation complete.")
    print(f"Total Successful Sales: {successful_sales}")

if __name__ == "__main__":
    simulate_sales()
