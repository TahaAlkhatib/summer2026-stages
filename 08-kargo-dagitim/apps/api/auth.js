const jwt = require('jsonwebtoken');

function tokenUret(kullanici) {
  return jwt.sign(
    {
      id: kullanici.id,
      username: kullanici.username,
      role: kullanici.role,
      fullName: kullanici.full_name,
      branchId: kullanici.branch_id,
      merchantId: kullanici.merchant_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function girisGerekli(req, res, next) {
  const baslik = req.headers.authorization || '';
  const token = baslik.startsWith('Bearer ') ? baslik.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Bu işlem için giriş yapmalısınız.' });
  }

  try {
    req.kullanici = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Oturumunuz sona ermiş. Tekrar giriş yapın.' });
  }
}

function rolGerekli(...roller) {
  return function (req, res, next) {
    if (!roller.includes(req.kullanici.role)) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
    }
    next();
  };
}

module.exports = { tokenUret, girisGerekli, rolGerekli };
