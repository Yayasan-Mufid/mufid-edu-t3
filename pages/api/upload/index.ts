import nextConnect, { RequestHandler } from 'next-connect';
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next'

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads',
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}-${file.originalname}`)
    }
  })
})

const apiRoute = nextConnect({
  onError(err, req, res: NextApiResponse) {
    res.status(501).json({ error: err.message })
  },
  onNoMatch(req, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method} is not allowed` })
  }
})

apiRoute.use(upload.single('file'))


interface ExtendedRequest {
  file: {
    path: string,
    filename: string,
  }
}

apiRoute.post<ExtendedRequest, NextApiRequest>(function(req, res: NextApiResponse) {
  res.status(200).json({ filename: req.file.path.replace('public/', '/') })
})

export default apiRoute

export const config = {
  api: {
    bodyParser: false
  }
}