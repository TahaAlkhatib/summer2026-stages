// MongoDB her kaydı "_id" alanında tutar. Arayüzler ve masaüstü uygulaması
// "id" alanını beklediği için JSON'a çevirirken alan adını değiştiriyoruz.
const jsonAyarlari = {
  versionKey: false,
  transform: function (belge, nesne) {
    nesne.id = nesne._id.toString();
    delete nesne._id;
    return nesne;
  },
};

// Belgeyi düz nesneye çevirir (id alanı dahil).
// Cevabı elle kurduğumuz yerlerde kullanıyoruz.
function duzNesne(belge) {
  if (!belge) return null;
  return belge.toJSON();
}

module.exports = { jsonAyarlari, duzNesne };
