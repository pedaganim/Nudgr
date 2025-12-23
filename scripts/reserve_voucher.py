
import redis
import time
import sys
import argparse

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Lua Script for Atomic Reservation
# Tries to reserve a SPECIFIC voucher or POPS one if not specified
RESERVE_SCRIPT = """
local uuid = ARGV[1]
local timeout_ts = ARGV[2]
local idempotency_key = ARGV[3]
local ttl_seconds = ARGV[4]

-- 1. Idempotency Check
-- If we have already seen this request, return the previously result
local idem_redis_key = "idempotency:" .. idempotency_key
if idempotency_key ~= "" then
    local existing_uuid = redis.call("GET", idem_redis_key)
    if existing_uuid then
        return existing_uuid
    end
end

local pending_status = "PENDING_CLAIM"

-- 2. Reservation Logic
-- If UUID is empty, we must pick one from available set
if uuid == "" then
    uuid = redis.call("SPOP", KEYS[2])
    if not uuid then
        return nil -- No vouchers available
    end
else
    -- Verify the specific UUID is actually available
    if redis.call("SISMEMBER", KEYS[2], uuid) == 0 then
        return nil -- Not available
    end
    -- Remove from available set
    redis.call("SREM", KEYS[2], uuid)
end

local voucher_key = "voucher:" .. uuid

-- Update Status in Hash
redis.call("HSET", voucher_key, "status", pending_status)

-- Add to Pending Set
redis.call("SADD", KEYS[3], uuid)

-- Add to Timeout ZSet
redis.call("ZADD", KEYS[4], timeout_ts, uuid)

-- 3. Save Idempotency Record
if idempotency_key ~= "" then
    redis.call("SET", idem_redis_key, uuid, "EX", ttl_seconds)
end

return uuid
"""

def reserve_voucher(uuid_to_reserve=None, timeout_seconds=300, idempotency_key=None):
    script = r.register_script(RESERVE_SCRIPT)
    
    keys = [
        "ignored", # placeholder
        "vouchers:available",
        "vouchers:pending",
        "vouchers:pending_timeouts"
    ]
    
    # Args
    expire_at = int(time.time()) + timeout_seconds
    argv = [
        uuid_to_reserve if uuid_to_reserve else "",
        expire_at,
        idempotency_key if idempotency_key else "",
        timeout_seconds
    ]
    
    result_uuid = script(keys=keys, args=argv)
    
    if result_uuid:
        print(f"✅ Successfully reserved voucher: {result_uuid}")
        print(f"   Expires at: {time.ctime(expire_at)}")
        return result_uuid
    else:
        if uuid_to_reserve:
            print(f"❌ Failed to reserve voucher {uuid_to_reserve}: Not available.")
        else:
            print("❌ Failed to reserve voucher: No vouchers available.")
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Reserve a voucher.')
    parser.add_argument('--uuid', type=str, help='Specific UUID to reserve', default=None)
    parser.add_argument('--timeout', type=int, help='Timeout in seconds', default=300)
    parser.add_argument('--idempotency-key', type=str, help='Unique key for request retries', default=None)
    
    args = parser.parse_args()
    
    try:
        reserve_voucher(args.uuid, args.timeout, args.idempotency_key)
    except redis.exceptions.ConnectionError:
        print("Error: Could not connect to Redis at localhost:6379")
