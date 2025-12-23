
import redis
import uuid
import time

# Connect to Redis
# Using 'localhost' assuming running from host machine against exposed port 6379
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def load_vouchers(available=1000, pending=100, claimed=200):
    print(f"Loading vouchers: {available} AVAILABLE, {pending} PENDING, {claimed} CLAIMED...")
    pipeline = r.pipeline()
    
    def add_voucher(status):
        v_uuid = str(uuid.uuid4())
        key = f"voucher:{v_uuid}"
        
        data = {
            "status": status,
            "created_at": int(time.time()),
            "expires_at": int(time.time()) + 3600 * 24 * 30, # 30 days
            "uuid": v_uuid
        }
        
        pipeline.hset(key, mapping=data)
        
        if status == "AVAILABLE":
            pipeline.sadd("vouchers:available", v_uuid)
        elif status == "PENDING_CLAIM":
            pipeline.sadd("vouchers:pending", v_uuid)
        elif status == "CLAIMED":
            pipeline.sadd("vouchers:claimed", v_uuid)

    for _ in range(available): add_voucher("AVAILABLE")
    for _ in range(pending): add_voucher("PENDING_CLAIM")
    for _ in range(claimed): add_voucher("CLAIMED")
        
    pipeline.execute()
    print("Successfully loaded vouchers.")
    print(f"Available: {r.scard('vouchers:available')}")
    print(f"Pending: {r.scard('vouchers:pending')}")
    print(f"Claimed: {r.scard('vouchers:claimed')}")

if __name__ == "__main__":
    try:
        load_vouchers()
    except redis.exceptions.ConnectionError:
        print("Error: Could not connect to Redis at localhost:6379")
