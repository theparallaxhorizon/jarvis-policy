# JARVIS Policy Engine — Güvenlik Sözleşmesi ve Mevcut Durum

**Sürüm:** v1.0
**Tarih:** 23 Ekim 2026
**Durum:** Statik kaynak kodu incelemesi tamamlandı. Bazı güvenlik davranışları kaynak kodunda destekleniyor; runtime doğrulaması bekliyor.

---

## 1. Özet

Bu belge, JARVIS Policy Engine'in mevcut güvenlik durumunu, doğrulanmış bulguları ve açık konuları kaydeder. Belge, **kanıtlanmış** (kaynak kodda mevcut) ve **kanıtlanmamış** (runtime doğrulaması bekleyen) bilgileri **açıkça ayırır**.

---

## 2. Mevcut Durum

### 2.1. Çalışan Bileşenler

| Bileşen | Dosya | Durum |
|---|---|---|
| `jarvis_policy_analyze` | `dist/contract.js` + `dist/index.js` | ✅ Araç çağrısı gözlemlendi; güvenlik hook'unun çalıştığını kanıtlamaz |
| `before_tool_call` hook'u | `dist/index.js` (satır 10-18) | 🟡 Kaynak kodunda mevcut; runtime doğrulaması bekliyor |
| `registerTrustedToolPolicy` | `dist/index.js` (satır 19-46) | 🟡 Kaynak kodunda mevcut; etkinliği belirsiz |

### 2.2. `jarvis_policy_analyze` Aracı

**Giriş şeması** (`contract.js`):
```javascript
input: Type.Object({ text: Type.String({ maxLength: 32000 }) }, { additionalProperties: false })

api.on("before_tool_call", (event) => {
    if (event.toolName.toLowerCase() === "jarvis_policy_analyze" &&
        event.params.text === DENY_TEST_SENTINEL) {
        return { block: true, blockReason: "..." };
    }
});
---

## 3. Güvenlik Sözleşmesi (Hedef)

### 3.1. Politika Kararları

| Karar | Hedef davranış |
|---|---|
| **ALLOW** | Politika izin veriyorsa çağrı yürütülür. |
| **APPROVAL** | Gerekli kullanıcı onayı alınır. |
| **DENY** | Çağrı engellenir. |

### 3.2. Onay Başarısızlığı Davranışı

Fail-closed davranışına ilişkin kaynak kodu bulguları, incelenen yollarla sınırlıdır. Tüm çağrı yollarının bu davranışı uyguladığı çalışma zamanında henüz doğrulanmamıştır.

### 3.3. MCP Araçlarının Kapsamı

Lab yapılandırmasında n8n MCP bağlantısı streamable HTTP kullanır. MCP çağrılarının ilgili politika kontrollerinden geçtiği henüz çalışma zamanında kanıtlanmamıştır.

---

## 4. Açık Konular

- `before_tool_call` hook'u gerçek araç çağrısında çalışıyor mu?
- `registerTrustedToolPolicy` çalışma zamanında etkin mi?
- MCP araç çağrıları ilgili güvenlik kontrollerinden geçiyor mu?
- Onay akışının başarı, ret ve zaman aşımı davranışları doğrulandı mı?
- Eklentinin `provenance-invalid` uyarısının etkisi nedir?

---

## 5. Karar Günlüğü

| Tarih | Kayıt | Gerekçe |
|---|---|---|
| 20.10.2026 | `dist/index.js` için yedek kaydı | Geri dönüş olanağını korumak |
| 22.10.2026 | `.new` taslağı oluşturuldu | Değişiklikleri etkin dosyalardan ayrı tutmak |
| 23.10.2026 | Taslak etkin dosyalara uygulanmadı | Runtime doğrulaması ve operasyonel güvenlik |
| 23.10.2026 | `SECURITY.md` için yedek oluşturuldu | Belgeyi güncellemeden önce mevcut içeriği korumak |

---

## 6. Sonuç

`jarvis_policy_analyze` ve güvenlik hook'larına ilişkin kod bulguları statik inceleme kapsamındadır. Bu bulgular tek başına aracın başarıyla çalıştığını veya güvenlik katmanının tüm çağrılarda uygulandığını kanıtlamaz.

**Belge durumu:** Taslak — çalışma zamanı doğrulaması bekliyor.

**Son güncelleme:** 23 Ekim 2026
