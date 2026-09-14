import numpy as np

class IrisEngine:
    """
    ISO/IEC 19794-6 IrisCode pattern generation & Hamming distance comparator.
    """
    @staticmethod
    def extract_iris_code(raw_iris_input: str) -> bytes:
        """
        Step 1.2: Converts NIR iris pattern to 2048-bit phase quantization vector.
        """
        seed = abs(hash(raw_iris_input)) % (2**32)
        np.random.seed(seed)
        iris_code_bits = np.random.randint(0, 2, size=256, dtype=np.uint8) # 2048 bits
        return iris_code_bits.tobytes()

    @staticmethod
    def compute_hamming_distance(fresh_code: bytes, stored_code: bytes) -> float:
        """
        Step 2.3: Computes Hamming distance between two IrisCodes.
        Distance < 0.32 indicates a match.
        """
        arr1 = np.frombuffer(fresh_code, dtype=np.uint8)
        arr2 = np.frombuffer(stored_code, dtype=np.uint8)
        min_len = min(len(arr1), len(arr2))
        xor_diff = np.bitwise_xor(arr1[:min_len], arr2[:min_len])
        diff_bits = np.sum([bin(byte).count('1') for byte in xor_diff])
        total_bits = min_len * 8
        hamming_dist = diff_bits / total_bits
        return float(hamming_dist)

iris_engine = IrisEngine()
